import React from "react";

const page = async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  return <div>account created</div>;
};

export default page;
