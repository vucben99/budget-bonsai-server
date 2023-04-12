"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const EnvSchema = zod_1.z.object({
    PORT: zod_1.z.string().nonempty(),
    MONGODB_URI: zod_1.z.string().nonempty()
});
const env = EnvSchema.parse(process.env);
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/', (req, res) => {
    res.json("hello");
});
mongoose_1.default.connect(env.MONGODB_URI);
console.log('⚡️[Server] MongoDB connected');
app.listen(env.PORT, () => console.log('⚡️[Server] Server is listening on port', env.PORT));
