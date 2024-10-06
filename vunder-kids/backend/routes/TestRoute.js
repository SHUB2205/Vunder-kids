const mongoose = require('mongoose');
const User=require("../models/User");


const userId = '66cba2c29fd96388c0e9c078';
const followersToAdd = [
  { _id: '66afc54d7be83c2bf8154ec5' },
  { _id: '66b0e75a9751c1602ce93ea8' },
  { _id: '66b7de57e213f457346a1de7' },
  {_id:  '66b7dea3e213f457346a1ded' },
  {_id:  '66b7dea3e213f457346a1ded' },
  {_id:  '66b7dea3e213f457346a1ded' }
];

async function addFollowers() {
  try {
    const result = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { followers: { $each: followersToAdd } }
      },
      { new: true, runValidators: true }
    );

    if (!result) {
      console.log('User not found');
    } else {
      console.log('Updated User:', result);
    }
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

addFollowers();

module.exports = {
  addFollowers
    
  };


