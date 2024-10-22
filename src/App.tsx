import Text from './Text';
import BirdImage from './Bird';
import Socials from './Socials';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <>
      <div className='upperArea'>
        <BirdImage />
        <Text />
      </div>
      <Socials />
      <Analytics />
    </>
  );
}

export default App;