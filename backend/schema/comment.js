export const CommentSchema = {
  PinParent: {
    isInt: { errorMessage: "PinParent must be an integer" },
  },
  CommentParent: {
    optional: { options: { nullable: true } },
    isInt: { errorMessage: "CommentParent must be an integer" },
  },
  replyLevel: {
    optional: { options: { nullable: true } },
    isInt: { errorMessage: "replyLevel must be an integer" },
  },
  replyLevel: {
    isInt: { errorMessage: "replyLevel must be an integer" },
  },
  comment: {
    notEmpty: { errorMessage: "Comment cannot be empty" },
  },
};
