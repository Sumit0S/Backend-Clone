import { channel } from 'diagnostics_channel';
import mangoose ,{Schema} from 'mangoose';

const subsriptionSchema= new Schema({
    subscribe:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"      
    }
});

export const Subscription=mangoose.model('Subscription',subsriptionSchema);
