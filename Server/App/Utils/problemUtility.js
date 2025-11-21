import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const API_KEY = process.env.Judge0_APIKEY;

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };

  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  // options object store the data that is necessary to make the API call
  // it create the method type , JJudge0 Submission URL, our api Key and host and the submissions offcourse

  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions: submissions,
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      console.log("Data Fetched: ");
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return await fetchData();
};

// const waiting = async (timer) => {
//   setTimeout(() => {
//     return 1;
//   }, timer);
// };

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const submitToken = async (resultToken) => {
  const tokenString = Array.isArray(resultToken)
    ? resultToken.join(",")
    : resultToken;
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: tokenString,
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      console.log("Check out response.data::::   ", response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  while (true) {
    const result = await fetchData();

    const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

    if (IsResultObtained) return result.submissions;

    await waiting(1000);
  }
};

export { submitBatch, submitToken, getLanguageById };
