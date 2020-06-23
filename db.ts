import { MongoClient } from "https://deno.land/x/mongo@v0.8.0/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

const client = new MongoClient()
const mongoUri: string = Deno.env.get('MONGO_URI') || ''
// console.log(mongoUri)
client.connectWithUri(mongoUri)

const db = client.database('deno')

export default db
