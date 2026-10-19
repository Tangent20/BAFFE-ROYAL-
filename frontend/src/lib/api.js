import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const submitScore = async (payload) => {
    const res = await axios.post(`${API}/scores`, payload);
    return res.data;
};

export const getTopScores = async () => {
    const res = await axios.get(`${API}/scores/top?limit=20`);
    return res.data;
};

export const getDailyScores = async () => {
    const res = await axios.get(`${API}/scores/daily?limit=10`);
    return res.data;
};

export const getRank = async (score) => {
    const res = await axios.get(`${API}/scores/rank/${score}`);
    return res.data;
};

export const getStats = async () => {
    const res = await axios.get(`${API}/stats`);
    return res.data;
};

export const getAITaunt = async ({ pseudo, score, grade }) => {
    const res = await axios.post(`${API}/taunt`, { pseudo, score, grade });
    return res.data.taunt;
};
