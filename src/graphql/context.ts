import { Context } from "./types";
import express from "express";

type input = {
  req: express.Request;
  res: express.Response;
};

const context = ({ req }: input): Context => {
  return {
    req,
  };
};

export default context;
