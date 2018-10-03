import childProcess from "child_process";
import dotenv from "dotenv";

dotenv.config();

const port: number = Number(process.env.PORT) || 3000;

const dockerBuildCmd: string = `docker build -t app --build-arg port=${port} .`;
console.log("Build command:", dockerBuildCmd);

const output = childProcess.execSync(dockerBuildCmd);

console.log(output.toString());
