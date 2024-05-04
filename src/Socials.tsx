import github from './assets/github.svg';
import discord from './assets/discord.svg';
import twitter from './assets/twitter.svg';

function Socials() {
    let githubUrl = () => { window.open("https://github.com/meesam4687") }
    let discordUrl = () => { window.open("https://discord.com/users/809702164724449290") }
    let twitterUrl = () => { window.open("https://twitter.com/msm4687") }
    return (
        <div className="socials">
            <img onClick={githubUrl} className="icon" src={github} />
            <img onClick={discordUrl} className="icon" src={discord} />
            <img onClick={twitterUrl} className="icon" src={twitter} />
        </div>
    );
}

export default Socials;