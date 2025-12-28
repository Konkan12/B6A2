import { Response } from "express";

const sendJson = (res: Response, data: any, statusCode: number) => {
  return res.status(statusCode).json(data);
};

export default sendJson;