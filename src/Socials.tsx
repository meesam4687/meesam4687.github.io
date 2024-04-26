import github from './assets/github.svg';
import discord from './assets/discord.svg';
import twitter from './assets/twitter.svg';

function Socials() {
    return (
        <div className="socials">
            <img className="icon" src={github} />
            <img className="icon" src={discord} />
            <img className="icon" src={twitter} />
        </div>
    );
}

export default Socials;