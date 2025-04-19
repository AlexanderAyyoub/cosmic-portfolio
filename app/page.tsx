import HomeScene from "components/home-scene";
import getAllStars from "./server_actions/getAllStars";

export default async function Home(){
  const checkData = await getAllStars();

  return <HomeScene stars={checkData} />; 

  
}