
"use client";

import { useEffect, useState } from "react";

export default function DynamicDate() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(new Date());
    };

    updateDate();

    const timer = setInterval(updateDate, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!currentDate) {
    return <span>Loading date...</span>;
  }

  return (
    <span>
      {currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </span>
  );
}
