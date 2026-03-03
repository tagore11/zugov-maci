import Image from 'next/image';
import Link from 'next/link';
import { Github, Logo, Mail, Telegram, X } from '../../../../public';
import styles from './index.module.css';

const socialMedia = [
  {
    icon: Github,
    link: 'https://github.com/PriVote-Project'
  },
  {
    icon: Telegram,
    link: 'https://t.me/+MBIz8ZBIllExZDQ1'
  },
  {
    icon: X,
    link: 'https://x.com/privoteweb3'
  },
  {
    icon: Mail,
    link: 'mailto:privote.live@gmail.com'
  }
];

const Footer = () => {
  return (
    <div className={styles.container}>
      <footer className={styles.footer}>
        <div className={styles['logo']}>
          <Image src={Logo} alt='logo' width={30} height={30} />
          <p>
            PRI<span className={styles.highlight}>VOTE</span>
          </p>
        </div>
        <div className={styles['social-media']}>
          {socialMedia.map((social, index) => (
            <Link href={social.link} className={styles['img-container']} key={index} target='_blank'>
              <Image src={social.icon} alt='social' width={20} height={20} />
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Footer;
