import app from "./app";

const port = process.env.PORT || 8002;

//test
const main = () => {
  app.listen(port, async () => {
    console.log("HTTP Server is running on ", +port);
  });
};

main();
