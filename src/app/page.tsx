'use client'
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {

  const getGeolocation = async () => {
    const body = {
      address: "4600 SILVER HILL RD, WASHINGTON, DC, 20233"
    }
    const res = await fetch('/api/forecast', { method: "POST", body: JSON.stringify(body) });
    const data = await res.json()
    console.log(data)
  }

  useEffect(() => {
    getGeolocation();
  }, [])

  return (
    <div>Hello World</div>
  );
}
