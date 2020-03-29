import express from "express";

const rest = (app: express.Application): express.Application => {
  app.get("/", (_req, res) => {
    res.send("Hello World!");
  });
  return app;
};

export default rest;
