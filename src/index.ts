import { Composer } from "./composer";
import { RPCServer } from "./rpc-server";

const composer = new Composer();

composer.register("sum", async (params: { a: number; b: number }) => {
    return params.a + params.b;
});

composer.register("greet", async (params: { name: string }) => {
    return `Hello, ${params.name}!`;
});


const server = new RPCServer(3000, "127.0.0.1", composer);
server.start();
