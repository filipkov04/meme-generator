import { i } from '@instantdb/react';

const schema = i.schema({
  memes: {
    imageData: i.string(),
    textBoxes: i.string(),
    createdAt: i.number(),
    createdBy: i.string(),
    upvoteCount: i.number(),
  },
  upvotes: {
    memeId: i.string(),
    userId: i.string(),
    createdAt: i.number(),
  },
});

export default schema;
