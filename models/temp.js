import { MongoClient } from 'mongodb';
import {
  ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$match': {
      'product': new ObjectId('64b95caa99b8e790d3c1c3eb')
    }
  }, {
    '$group': {
      '_id': '$product', 
      'averageRating': {
        '$avg': '$rating'
      }, 
      'numOfReviews': {
        '$sum': 1
      }
    }
  }
];

const client = await MongoClient.connect(
  '',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const coll = client.db('10-E-COMMERCE').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();