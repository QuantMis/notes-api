import { App } from "cdktf";
import { NotesStack } from "./notes-stack.js";

const app = new App();
new NotesStack(app, "notes-stack");
app.synth();
