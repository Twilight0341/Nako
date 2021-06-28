import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { delay } from "../utils/utils";
import { AccountInfo } from "./account-info";

// eslint-disable-next-line @typescript-eslint/ban-types
type Narrowable = string | number | boolean | symbol | object | {} | void | null | undefined;
const tuple = <T extends Narrowable[]>(...args: T) => args;
type UnionToIntersection<U> = (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never;

interface WebSocketSubscription<M extends WebSocketMessageMethod, T extends WebSocketMessageType> extends WebSocketMessageMetadata<M, T> {
  fn: (res: WebSocketMessagePayload<M, T>, id: number) => void;
  res: (value: WebSocketMessagePayload<M, T> | PromiseLike<WebSocketMessagePayload<M, T>>) => void;
  id: number;
}

type NakoAPIEvent = {
  messageSent: (data: WebSocketMessage<WebSocketMessageMethod, WebSocketMessageType>) => void,
  messageReceived: (data: WebSocketMessage<WebSocketMessageMethod, WebSocketMessageType>) => void,
  close: (e: CloseEvent) => void,
  error: (e: Event) => void;
};

/**`
 * @class A class to send and receive Nako WebSocket messages.
 */
class NakoAPI {
  private connection: WebSocket;

  private subscriptions = new Array<WebSocketSubscription<WebSocketMessageMethod, WebSocketMessageType>>();

  private lifetimeSubscriptionCount = 0;

  /**
   * Returns a Promise that resolves to the first matching message. The subscription is cancelled after the promise is returned.
   * @param method The method of the message.
   * @param type   The type of the message.
   * @returns      A Promise that resolves to the first matching message.
   */
  public subscribe<M extends WebSocketMessageMethod, T extends WebSocketMessageType>(method: M, type: T): Promise<WebSocketMessagePayload<M, T>>;

  /**
   * Triggers the callback function when a message of matching method and type is received.
   * @param method     The method of the message.
   * @param type       The type of the message.
   * @param callbackFn The callback function that will be called when a matching message is received.
   * @returns          The ID of the subscription.
   */
  public subscribe<M extends WebSocketMessageMethod, T extends WebSocketMessageType>(
    method: M, type: T, callbackFn: (message: WebSocketMessagePayload<M, T>, id: number) => void
  ): number;

  // I hope I find a way such that it is possible to do .subscribe<M, T>(...).reply(msg) like a Promise.

  public subscribe<M extends WebSocketMessageMethod, T extends WebSocketMessageType>(
    method: M, type: T, callbackFn?: (payload: WebSocketMessagePayload<M, T>, id: number) => void
  ): number | Promise<WebSocketMessagePayload<M, T>> {
    this.lifetimeSubscriptionCount++;
    let resolve: (value: WebSocketMessagePayload<M, T> | PromiseLike<WebSocketMessagePayload<M, T>>) => void;
    const promise = new Promise<WebSocketMessagePayload<M, T>>(res => resolve = res);
    const id = this.lifetimeSubscriptionCount;

    const sub: WebSocketSubscription<M, T> = {
      method: method,
      type: type,
      fn: callbackFn ?? (() => {this.unsubscribe(id);}),
      res: resolve!,
      id: id
    };
    
    this.subscriptions.push(sub);

    return callbackFn ? id : promise;
  }

  /**
   * Unsubscribes a subscription by ID.
   * @param id The ID of the subscription.
   */
  public unsubscribe(id: number) {
    const idx = this.subscriptions.findIndex(i => i.id === id);

    if (idx !== -1) {
      this.subscriptions.splice(idx, 1);
    } else {
      throw new Error(`Subscription with ID ${id} not found.`);
    }
  }

  /**
   * Unsubscribes all active subscriptions.
   */
  public unsubscribeAll() {
    this.subscriptions = [];
  }

  private emitter = new EventEmitter() as TypedEmitter<NakoAPIEvent>;

  // You can't do public on = this.emitter.on; :[
  public on = <E extends keyof NakoAPIEvent>(event: E, listener: NakoAPIEvent[E]) => this.emitter.on(event, listener);

  public off = <E extends keyof NakoAPIEvent>(event: E, listener: NakoAPIEvent[E]) => this.emitter.off(event, listener);

  public close(removeAllListeners = true, code?: number, reason?: string) {
    this.connection.close(code, reason);

    if (removeAllListeners) {
      this.emitter.removeAllListeners();
    }
  }

  /**
   * Sends a message through the WebSocket connection.
   * @param  msg The message to send.
   */
  public async send<M extends Exclude<WebSocketMessageMethod, "req">, T extends WebSocketMessageType>(msg: WebSocketMessage<M, T>): Promise<void>;
  

  /**
   * Sends a message through the WebSocket connection.
   * @param  msg     The message to send.
   * @returns        A promise that is resolved toa WebSocketMessagePayload when a response is received.
   */
  public async send<M extends "req", T extends WebSocketMessageType>(msg: WebSocketMessage<M, T>): Promise<WebSocketMessagePayload<"res", T>>;

    /**
   * Sends a message through the WebSocket connection.
   * @param  msg     The message to send.
   * @param  timeout This is the duration in ms that this function will wait for a response. Default is -1.
   *                 Any value below 0 represents no timeout limit. No effects on response messages.
   * @returns        A promise that is resolved to either a WebSocketMessagePayload when a response is received, or undefined if no response is received before timeout.
   */
     public async send<M extends "req", T extends WebSocketMessageType>(msg: WebSocketMessage<M, T>, timeout?: number): Promise<undefined | WebSocketMessagePayload<"res", T>>;

  public async send<M extends WebSocketMessageMethod, T extends WebSocketMessageType>(msg: WebSocketMessage<M, T>, timeout = -1): Promise<void | undefined | WebSocketMessagePayload<"res", T>> {
    while (this.connection.readyState !== this.connection.OPEN) {
      await delay(500);
    }

    this.connection.send(JSON.stringify(msg));
    this.emitter.emit("messageSent", msg);

    if (msg.method === "req") {
      let res: undefined | WebSocketMessagePayload<"res", T>;
      if (timeout >= 0) {
        res = await Promise.race([this.subscribe("res", msg.type), delay(timeout).then(() => undefined)]);
      } else {
        res = (await this.subscribe("res", msg.type)) as WebSocketMessagePayload<"res", T>;
      }

      return res;
    }
  }

  constructor(socketURL: string) {
    (window as any).Nako = this;
    this.connection = new WebSocket(socketURL);

    this.connection.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);

        if (WebSocketMessageMethodArray.includes(msg.method) && WebSocketMessageTypeArray.includes(msg.type)) {
          const parsedMsg = msg as WebSocketMessage<WebSocketMessageMethod, WebSocketMessageType>;
          this.emitter.emit("messageReceived", parsedMsg);
          
          // Resolve subscriptions
          for (const i of this.subscriptions.filter(j => j.method === parsedMsg.method && j.type === parsedMsg.type)) {
            i.res(parsedMsg.payload);
            i.fn(parsedMsg.payload, i.id);
          }
        } else {
          console.warn("Invalid message:");
          console.warn(msg);
        }
      } catch (error) {
        console.log("An error occurred while processing the message:");
        console.error(error);
        console.error(e.data);
      }
    };

    this.connection.onclose = e => this.emitter.emit("close", e);
    this.connection.onerror = e => this.emitter.emit("error", e);
  }
}

export type AccountRole = "student" | "teacher";

export type LobbyInfo = {
  id: number;
  players: string[];    // Should include self
}

type BaseQuestionInfo<A, T extends QuestionType> = {
  question: string;
  timeLimit: number;
  answer: A;
  type: T;
}

type SelectableChoices = {
  choices: string[];
  maxSelection: number;
}

export type MultipleChoiceAnswer = number | number[];

// T is the type of answer
export type MultipleChoiceQuestion<T extends MultipleChoiceAnswer = MultipleChoiceAnswer> = BaseQuestionInfo<T, "multiple_choice"> &
  (T extends number ? Omit<SelectableChoices, "maxSelection"> : SelectableChoices);    // Imply 1 when omitted

export type FillBlankAnswer = string | string[] | number | number[];

type BaseFillBlankQuestion<T extends [string, string] | string[]> = {
  context: T;
}

/**
 * T is the type of the answer.
 * 
 * Assignable objects, when T is:
 * @example
 * string   => { question: string, answer: string, context: [string, string], timeLimit: number }
 * string[] => { question: string, answer: string[], context: string[], timeLimit: number }
 * number   => { question: string, answer: number, context: [string, string], timeLimit: number, choices: string[] }
 * number[] => { question: string, answer: number[], context: string[], timeLimit: number, choices: string[] }
 */
export type FillBlankQuestion<T extends FillBlankAnswer = FillBlankAnswer> = BaseQuestionInfo<T, "fill_blank"> & (
  UnionToIntersection<T> extends UnionToIntersection<FillBlankAnswer> ?
    (BaseFillBlankQuestion<[string, string] | string[]> & Partial<Omit<SelectableChoices, "maxSelection">>) :
    ((T extends string | number ? BaseFillBlankQuestion<[string, string]> : BaseFillBlankQuestion<string[]>) &
      (T extends number | number[] ? Omit<SelectableChoices, "maxSelection"> : {}))
    // Equivalent to this:
    // T extends string ? BaseFillBlankQuestion<[string, string]> :
    // T extends string[] ? BaseFillBlankQuestion<string[]> :
    // T extends number ? BaseFillBlankQuestion<[string, string]> & Omit<SelectableChoices, "maxSelection"> :
    // T extends number[] ? BaseFillBlankQuestion<string[]> & Omit<SelectableChoices, "maxSelection"> :
    // never
);

export type QuestionType = "multiple_choice" | "fill_blank";

export type Question<QuestionType> = 
  QuestionType extends "multiple_choice" ? MultipleChoiceQuestion<MultipleChoiceAnswer> : 
  QuestionType extends "fill_blank" ? FillBlankQuestion<FillBlankAnswer> :
  never;

export type QuestionInfo<R extends AccountRole, T extends Question<QuestionType>> = R extends "teacher" ? T : Omit<T, "answer">;

export function isQuestion(obj: unknown): obj is Question<QuestionType> {
  return typeof obj === "object" && obj !== null && "question" in obj && "timeLimit" in obj && "answer" in obj && "type" in obj;
}

export type GameInfo<R extends AccountRole> = {
  role: R;
  questions: QuestionInfo<R, Question<QuestionType>>[];
}

const WebSocketMessageMethodArray = tuple("req", "res", "post");

export type WebSocketMessageMethod = (typeof WebSocketMessageMethodArray)[number];

const WebSocketMessageTypeArray = tuple("lobby_create", "lobby_join", "lobby_leave", "lobby_update", "keep_alive", "game_start", "game_update", "game_end",
                                        "question_start", "question_end", "answer_question", "lobby_close");

export type WebSocketMessageType = (typeof WebSocketMessageTypeArray)[number];

export type WebSocketMessagePayload<M extends WebSocketMessageMethod, T extends WebSocketMessageType> =
  M extends "req" ?
    T extends "lobby_create" ? LobbyCreateRequest :
    T extends "lobby_join" ? LobbyJoinRequest :
    T extends "lobby_leave" ? LobbyLeaveRequest :
    T extends "lobby_update" ? LobbyUpdateRequest :
    T extends "keep_alive" ? KeepAliveRequest :
    T extends "game_start" ? GameStartRequest :
    T extends "game_update" ? GameUpdateRequest :
    T extends "game_end" ? GameEndRequest :
    T extends "question_start" ? QuestionStartRequest :
    T extends "question_end" ? QuestionEndRequest :
    T extends "answer_question" ? AnswerQuestionRequest :
    T extends "lobby_close" ? never :
    WebSocketRequest :
  M extends "res" ?
    T extends "lobby_create" ? LobbyCreateResponse :
    T extends "lobby_join" ? LobbyJoinResponse :
    T extends "lobby_leave" ? LobbyLeaveResponse :
    T extends "lobby_update" ? LobbyUpdateResponse :
    T extends "keep_alive" ? KeepAliveResponse :
    T extends "game_start" ? GameStartResponse :
    T extends "game_update" ? GameUpdateResponse :
    T extends "game_end" ? GameEndResponse :
    T extends "question_start" ? QuestionStartResponse :
    T extends "question_end" ? QuestionEndResponse :
    T extends "answer_question" ? AnswerQuestionResponse :
    T extends "lobby_close" ? never :
    WebSocketResponse :
  M extends "post" ?
    T extends "lobby_close" ? LobbyCloseEvent :
    T extends Omit<WebSocketMessageType, "lobby_close"> ? never :
    // T extends "lobby_join" ? never :
    // T extends "lobby_leave" ? never :
    // T extends "lobby_update" ? never :
    // T extends "keep_alive" ? never :
    // T extends "game_start" ? never :
    // T extends "game_update" ? never :
    // T extends "game_end" ? never :
    // T extends "question_start" ? never :
    // T extends "question_end" ? never :
    // T extends "answer_question" ? never :
    WebSocketPost :
  WebSocketRequest | WebSocketResponse

export type WebSocketMessageMetadata<M extends WebSocketMessageMethod, T extends WebSocketMessageType> = {
  method: M;
  type: T;
}

export type WebSocketMessage<M extends WebSocketMessageMethod, T extends WebSocketMessageType> = WebSocketMessageMetadata<M, T> & {
  payload: WebSocketMessagePayload<M, T>;
}

export type WebSocketRequest = LobbyCreateRequest | LobbyJoinRequest | LobbyLeaveRequest | LobbyUpdateRequest | GameStartRequest | GameUpdateRequest |
                               GameEndRequest | QuestionStartRequest | QuestionEndRequest | AnswerQuestionRequest | KeepAliveRequest;

export type WebSocketResponse = LobbyCreateResponse | LobbyJoinResponse | LobbyLeaveResponse | LobbyUpdateResponse | GameStartResponse | GameUpdateResponse |
                                GameEndResponse | QuestionStartResponse | QuestionEndResponse | AnswerQuestionResponse | KeepAliveResponse;

export type WebSocketPost = LobbyCloseEvent;

export type LobbyCreateRequest = null;

export type LobbyCreateResponse = {
  lobbyID: number;
}

export type LobbyUpdateRequest = {    // Used only to check if the lobby exists
  lobbyID: number;
};

export type LobbyUpdateResponse = {
  lobbyInfo: LobbyInfo;
};

export type LobbyJoinRequest = {
  lobbyID: number;
  accountInfo: AccountInfo;
};

export type LobbyJoinResponse = {
  lobbyInfo: LobbyInfo | null;
  error?: string;
};

export type LobbyLeaveRequest = {
  lobbyID: number;
  name: string;
};

export type LobbyLeaveResponse = {
  lobbyInfo: LobbyInfo | null;
  error?: string;
};

export type KeepAliveRequest = null;

export type KeepAliveResponse = {
  name: string;
  lobbyID: number;
};

export type GameStartRequest = {
  gameInfo: GameInfo<AccountRole>;
};

export type GameStartResponse = null;

export type GameUpdateRequest = {
  currentQuestion: number;
};

export type GameUpdateResponse = null;

export type GameEndRequest = {
  name: string;
  score: number;
}[]

export type GameEndResponse = null;

export type QuestionStartRequest = null;

export type QuestionStartResponse = null;

export type QuestionEndRequest = {
  correctAnswer: number[];
  stats: {
    correct: number;
    incorrect: number;
    noAnswer: number;
  }
};

export type QuestionEndResponse = null;

export type AnswerQuestionRequest = {
  choice: number;
  currentQuestionCheck: number;
};

export type AnswerQuestionResponse = null;

export type LobbyCloseEvent = {
  reason?: string;
};

export default NakoAPI;