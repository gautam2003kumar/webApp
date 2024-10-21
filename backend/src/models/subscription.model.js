import mongoose , {Schema} from "mongoose";


const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User",
        require: true
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whon 'subscriber' is subscribing
        ref: "User",
        require: truec
    }
},{timestamps: true})


// Ensure a user can't subscribe to the same channel multiple times
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema)