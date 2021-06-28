import asyncio
import websockets
import json
import os
import threading

host = "localhost"
port = 1880

joinres = False
isroom = False
started = False
beginws = True

aliveplayer = []
aliveplayerid = []


async def hello(websocket, path):
    global beginws

    def string2json(str):
        return json.loads(str)

    def json2str(j):
        return str(j)

    async def handlejoin(id, obj):
        global aliveplayer
        global aliveplayerid
        global nojoin
        if checkroom():
            print("room is alive")
            if not findplayer(id):
                aliveplayer.append(obj)
                aliveplayerid.append(id)
                print("player joining")
                print("number of players: {p}".format(p=len(aliveplayer)))
                return True
            else:
                print("player is already inside")
                print("number of players: {p}".format(p=len(aliveplayer)))
        else:
            print("room is dead")
            aliveplayer = []

    async def handleleave(id, obj):
        pass

    def createroom():
        file = open("./ws.json", "w")
        file.close()
        print("room created")

    def delroom():
        global aliveplayer
        aliveplayer = []
        os.remove("./ws.json")
        print("room deleted")

    def checkroom():
        if os.path.exists("./ws.json"):
            return True

    def delplayer(p, id):
        global aliveplayer
        global aliveplayerid
        aliveplayer.remove(p)
        aliveplayerid.remove(id)

    def findplayer(player):
        global aliveplayerid
        if checkroom():
            for x in aliveplayerid:
                if x == player:
                    print("Find player: Player is presence")
                    return True
            else:
                print("Find player: Player is not presence")

    def ifopen(p, id):
        global aliveplayer
        if len(aliveplayer) > 0:
            if p.open:
                # print("player {} is alive".format(p))
                # print("player id:{}".format(id))
                pass
            else:
                print("player {} not alive killing from room".format(p))
                delplayer(p, id)
                print("Active players :{}".format(len(aliveplayer)))

    def routine():
        threading.Timer(0.3, routine).start()
        global aliveplayer
        global aliveplayerid
        x = len(aliveplayer)
        y = x - 1
        # print("Active players :{}".format(x))
        while x > 0:
            ifopen(aliveplayer[y], aliveplayerid[y])
            x -= 1
            y -= 1

    if beginws:
        routine()
        beginws = False

    global joinres
    global started
    global aliveplayerid
    await websocket.send("""{"type":"phuck" , "payload":"phuck you"}""")
    async for message in websocket:
        rec = await websocket.recv()
        print("WS MSG Received :", rec)
        rec = string2json(rec)
        if rec["method"] == "req":
            print("valid req")
            print(rec["type"])
            if rec["type"] == "lobby_join":
                if await handlejoin(rec["payload"]["name"], websocket) and not started:
                    print("Player {id} joined".format(id=rec["payload"]["name"]))
                    msg = """{"method":"re","type":"lobby_join","payload":{"lobbyInfo":{""" + """ "id": """ + f"""{rec["payload"]["name"]}""" + f""","players":{aliveplayerid} """ + "}}}"
                    msg = msg.replace("'", '"')
                    print(msg)
                    await websocket.send(msg)
                else:
                    await websocket.send(
                        """{"method":"res","type":"lobby_join","payload":{"lobbyInfo":null,"error":"forbidden"}}""")
            elif rec["type"] == "game_start":
                if len(aliveplayer) > 0:
                    for i in aliveplayer:
                        msg = """{"method":"req","type":"game_start","payload":{"lobbyInfo":null,"error":"no"}}"""
                        i.send(msg)
            elif rec["type"] == "lobby_update":
                print("asd")
                pass
            else:
                print("invalid type : {}".format(rec))
        else:
            print("Invalid method : {m}".format(m=rec["method"]))


start_server = websockets.serve(hello, host, port)
print('Starting Websocket Server at {h}:{p}'.format(h=host, p=port))

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
