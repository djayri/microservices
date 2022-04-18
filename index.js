const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { randomBytes } = require('crypto')

const app = express();
app.use(bodyParser.json());
app.use(cors());
const axios = require('axios')

const commentsByPostId = {};
const eventBusEndpoint = 'http://localhost:4005/events'

app.get('/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  res.send(commentsByPostId[postId] || [])
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const {content} = req.body;
  const postId = req.params.id;
  
  const comments = commentsByPostId[postId] || [];
  const newComment = {content, id: commentId}
  comments.push(newComment);

  commentsByPostId[postId] = comments;
  
  await axios.post(eventBusEndpoint, {type:'CommentCreated', data:{...newComment, postId}})

  res.status(201).send(comments)
});

app.post('/events', (req, res) => {
  const {type} = req.body
  console.log(`receiving ${type} event`)
  res.send({})
})

const port = 4001
app.listen(port, () => {
  console.log(`Listening on ${port}`)
});
