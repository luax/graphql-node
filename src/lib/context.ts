import { Context } from "./types";
import express from "express";
import postgres from "../postgres";

type input = {
  req: express.Request;
  res: express.Response;
};

const context = ({ req }: input): Context => {
  return {
    req,
    db: postgres,
  };
};

export default context;
