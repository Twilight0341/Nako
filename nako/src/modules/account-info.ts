export interface AccountInfo {
  name: string;
  role: "student" | "teacher"
}

export function isAccountInfo(obj: any): obj is AccountInfo {
  return typeof obj.name === "string";
}