import HomeScene from 'components/home-scene';
import getAllStars from './server_actions/getAllStars';
import LoadingScreenClient from 'components/loading-screen-client';

export default async function Home() {
  const checkData = await getAllStars();

  return (
    <>
      <LoadingScreenClient />
      <HomeScene stars={checkData} />
    </>
  );
}
