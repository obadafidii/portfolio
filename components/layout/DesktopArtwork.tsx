import Image from 'next/image';
import styles from './DesktopArtwork.module.css';

export const DesktopArtwork = ({ visible }: { visible: boolean }) => (
    <div className={styles.artwork} hidden={!visible}>
        <Image
            src="/images/artist-self-portrait.png"
            alt="An artist at an easel painting a portrait of himself"
            width={1000}
            height={1000}
            sizes="(max-width: 640px) 90vw, 520px"
            className={styles.image}
        />
    </div>
);
