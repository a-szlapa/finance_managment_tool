import { chartData } from "../types/chatData";

export default function genChartData(length: number): chartData {
  const today = new Date();

  return Array.from({ length }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    const balance = Number((Math.random() * 200 + 800).toFixed(2));

    return {
      date,
      balance,
      savings: 600,
      whatIf: balance,
    };
  });
}