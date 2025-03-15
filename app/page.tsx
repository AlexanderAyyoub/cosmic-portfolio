import HomeScene from "components/home-scene";
import getAllStars from "./server_actions/getAllStars";

export default async function Home(){
  const checkResponse = await getAllStars();
  const checkData = await checkResponse.json();

  return <HomeScene stars={checkData.stars} />; 

  
}