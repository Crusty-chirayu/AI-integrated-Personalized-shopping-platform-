export interface ToolResult {

  success: boolean;

  message: string;

  data?: any;

}

export interface ToolContext {

  userId?: string;

  sessionId: string;

}