const https = require('https');
const { URL } = require('url');

exports = async function() {
  const mongodb = context.services.get("TriviaTimeAPI");
  const db = mongodb.db("test");
  const collection = db.collection("dailies");

  try {
    while (true) {
      // Delete all documents in the 'dailies' collection
      await collection.deleteMany({});
      
      // Pick the Category at random
      const tagsUrl = new URL('https://the-trivia-api.com/v2/tags');
      const tagsResponse = await new Promise((resolve, reject) => {
        https.get(tagsUrl.href, (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            resolve(data);
          });
        }).on('error', (error) => {
          reject(error);
        });
      });
      const json = JSON.parse(tagsResponse);
      const todaysCat = json[Math.floor(Math.random() * json.length)];

      console.log(todaysCat);

      // Get questions in category
      const questionsUrl = new URL('https://the-trivia-api.com/v2/questions');
      questionsUrl.searchParams.append('tags', todaysCat);
      const questionsResponse = await new Promise((resolve, reject) => {
        https.get(questionsUrl.href, (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            resolve(data);
          });
        }).on('error', (error) => {
          reject(error);
        });
      });
      const questionArray = JSON.parse(questionsResponse);
      console.log(JSON.stringify(questionArray));

      if (questionArray.length >= 10){
        // Insert new document with category name and questions
        await collection.insertOne({
          catName: todaysCat,
          questions: JSON.stringify(questionArray)
        });
        console.log("New category updated successfully.");
        break; // Break the loop if a category with at least 10 questions is found
      } else {
        // Log if questions are less than 10
        console.log("Questions are less than 10. Trying another category.");
      }
    }
  } catch(err) {
    console.error("Error:", err);
  }
};
