export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export class ApiResponseUtil {
  static success<T>(
    message: string,
    data: T,
    statusCode: number = 200,
  ): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
    };
  }

  static error(
    message: string,
    error: string,
    statusCode: number = 400,
  ): ApiResponse<null> {
    return {
      statusCode,
      message,
      error,
    };
  }
}
