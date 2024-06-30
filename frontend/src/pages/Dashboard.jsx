import React, { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users } from "../components/User";

export const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/account/balance", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        setBalance(response.data.balance);
      } catch (err) {
        console.error("Error fetching balance", err);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div>
      <Appbar page="History" onClick={() => navigate("/history")} />
      <div className="m-8">
        <div className="text-2xl font-bold">Balance: {balance !== null ? `₹${balance.toFixed(2)}` : "Loading..."}</div>
        <Users />
      </div>
    </div>
  );
};

