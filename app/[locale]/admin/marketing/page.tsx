import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: '1월', 목표: 4000, 진행: 2400 },
  { name: '2월', 목표: 3000, 진행: 1398 },
  { name: '3월', 목표: 2000, 진행: 9800 },
  { name: '4월', 목표: 2780, 진행: 3908 },
  { name: '5월', 목표: 1890, 진행: 4800 },
  { name: '6월', 목표: 2390, 진행: 3800 },
  { name: '7월', 목표: 3490, 진행: 4300 },
];

export default function MarketingPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>마케팅 진행 상황</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="목표" stroke="#8884d8" />
            <Line type="monotone" dataKey="진행" stroke="#82ca9d" />
          </LineChart>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>챗봇</CardTitle>
        </CardHeader>
        <CardContent>
          <p>여기에 챗봇 인터페이스가 들어갑니다.</p>
        </CardContent>
      </Card>
    </div>
  );
} 