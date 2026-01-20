import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text, color }) => {
  return (
    <div className='flex items-center gap-1 text-sm mb-1'>
      <div className='flex text-yellow-500'>
        <span>
          {value >= 1 ? <FaStar /> : value >= 0.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        </span>
        <span>
          {value >= 2 ? <FaStar /> : value >= 1.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        </span>
        <span>
          {value >= 3 ? <FaStar /> : value >= 2.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        </span>
        <span>
          {value >= 4 ? <FaStar /> : value >= 3.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        </span>
        <span>
          {value >= 5 ? <FaStar /> : value >= 4.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        </span>
      </div>
      <span className='ml-2 text-gray-500 font-medium'>{text && text}</span>
    </div>
  );
};

Rating.defaultProps = {
  color: '#f8e825',
};

export default Rating;
