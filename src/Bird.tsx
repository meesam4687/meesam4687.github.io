import bird from './assets/bird.png';
function BirdImage() {
    return (
        <div className="profileImage">
            <img src={bird} alt="Bird" />
        </div>
    );
}
export default BirdImage;