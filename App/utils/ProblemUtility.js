import axios from "axios";

// we want to get the ID of the Language to submit it in Judge0
const getIDbyLanguageName = (lang) => {
  [
    {
      id: 45,
      name: "Assembly (NASM 2.14.02)",
    },
    {
      id: 46,
      name: "Bash (5.0.0)",
    },
    {
      id: 47,
      name: "Basic (FBC 1.07.1)",
    },
    {
      id: 48,
      name: "C (GCC 7.4.0)",
    },
    {
      id: 52,
      name: "C++ (GCC 7.4.0)",
    },
    {
      id: 49,
      name: "C (GCC 8.3.0)",
    },
    {
      id: 53,
      name: "C++ (GCC 8.3.0)",
    },
    {
      id: 50,
      name: "C (GCC 9.2.0)",
    },
    {
      id: 54,
      name: "C++ (GCC 9.2.0)",
    },
    {
      id: 51,
      name: "C# (Mono 6.6.0.161)",
    },
    {
      id: 55,
      name: "Common Lisp (SBCL 2.0.0)",
    },
    {
      id: 56,
      name: "D (DMD 2.089.1)",
    },
    {
      id: 57,
      name: "Elixir (1.9.4)",
    },
    {
      id: 58,
      name: "Erlang (OTP 22.2)",
    },
    {
      id: 44,
      name: "Executable",
    },
    {
      id: 59,
      name: "Fortran (GFortran 9.2.0)",
    },
    {
      id: 60,
      name: "Go (1.13.5)",
    },
    {
      id: 61,
      name: "Haskell (GHC 8.8.1)",
    },
    {
      id: 62,
      name: "Java (OpenJDK 13.0.1)",
    },
    {
      id: 63,
      name: "JavaScript (Node.js 12.14.0)",
    },
    {
      id: 64,
      name: "Lua (5.3.5)",
    },
    {
      id: 65,
      name: "OCaml (4.09.0)",
    },
    {
      id: 66,
      name: "Octave (5.1.0)",
    },
    {
      id: 67,
      name: "Pascal (FPC 3.0.4)",
    },
    {
      id: 68,
      name: "PHP (7.4.1)",
    },
    {
      id: 43,
      name: "Plain Text",
    },
    {
      id: 69,
      name: "Prolog (GNU Prolog 1.4.5)",
    },
    {
      id: 70,
      name: "Python (2.7.17)",
    },
    {
      id: 71,
      name: "Python (3.8.1)",
    },
    {
      id: 72,
      name: "Ruby (2.7.0)",
    },
    {
      id: 73,
      name: "Rust (1.40.0)",
    },
    {
      id: 74,
      name: "TypeScript (3.7.4)",
    },
  ];

  return language[lang.toLowerCase()];
};
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
      "x-rapidapi-key": "19a6df198fmsh93d1d52b134e13ap152deajsn958f5d30f96f",
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

const waiting = async (timer) => {
  setTimeout(() => {
    return 1;
  }, timer);
};

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
      "x-rapidapi-key": "19a6df198fmsh93d1d52b134e13ap152deajsn958f5d30f96f",
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

export { getIDbyLanguageName, submitBatch, submitToken, getLanguageById };
