const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB', err));

const userSchema = new mongoose.Schema({
  username: String,
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
});

const groupSchema = new mongoose.Schema({
  name: String,
  members: [
    {
      name: String,
      stars: { type: Number, default: 0 },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);

app.post('/api/register', async (req, res) => {
  const { username } = req.body;
  const user = new User({ username });
  await user.save();
  res.json(user);
});

app.post('/api/group', async (req, res) => {
  const { userId, groupName } = req.body;
  const group = new Group({ name: groupName, members: [], createdBy: userId });
  await group.save();
  const user = await User.findById(userId);
  user.groups.push(group._id);
  await user.save();
  res.json(group);
});

app.post('/api/group/:id/add-member', async (req, res) => {
  const { name } = req.body;
  const group = await Group.findById(req.params.id);
  group.members.push({ name, stars: 0 });
  await group.save();
  res.json(group);
});

app.post('/api/group/:id/give-star', async (req, res) => {
  const { memberIndex } = req.body;
  const group = await Group.findById(req.params.id);
  group.members[memberIndex].stars += 1;
  await group.save();
  res.json(group);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
