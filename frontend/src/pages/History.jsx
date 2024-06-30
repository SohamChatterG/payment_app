import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Appbar } from '../components/Appbar';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/user/history', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        });
        setTransactions(response.data.finalList);
      } catch (err) {
        console.error('Error fetching transactions', err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div>
      <Appbar page="Dashboard" onClick={() => navigate('/dashboard')} />
      <div className="m-8">
        <div className="font-bold mt-6 text-lg">Transactions</div>
        
        <div>
          {transactions.map((transaction, index) => (
            <TransactionItem key={index} transaction={transaction} />
          ))}
        </div>
      </div>
    </div>
  );
};

function TransactionItem({ transaction }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between m-4 p-2 border">
      <div className="flex">
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
          <div className="flex flex-col justify-center h-full text-xl">
            {transaction.from[0].toUpperCase()}
          </div>
        </div>
        <div className="flex flex-col justify-center h-full">
          <div>From: {transaction.from[0].toUpperCase()}{transaction.from.slice(1)}</div>
          <div>To: {transaction.to[0].toUpperCase()}{transaction.to.slice(1)}</div>
          <div>Amount: ₹{transaction.amount}</div>
        </div>
      </div>
      
    </div>
  );
}

export default History;
