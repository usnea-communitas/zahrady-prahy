'use client';

// The atlas's two dialogs: "Add a place" and "About". They and Base UI's dialog
// code load when a dialog is wanted (app/page.tsx), not with the atlas, so a
// first visit does not download or run them.
import { ArrowRight, Flower2, Leaf, Search, Sprout, Wheat } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from '@/components/ui/image';
import type { Dictionary } from '@/lib/i18n';

type Props = {
  t: Dictionary;
  addOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
  aboutOpen: boolean;
  onAboutOpenChange: (open: boolean) => void;
};

export default function AtlasDialogs({
  t,
  addOpen,
  onAddOpenChange,
  aboutOpen,
  onAboutOpenChange,
}: Props) {
  return (
    <>
      <Dialog open={addOpen} onOpenChange={onAddOpenChange}>
        <DialogContent
          className="add-garden-dialog"
          closeLabel={t.dialog.close}
        >
          <DialogHeader>
            <span className="dialog-eyebrow">
              <Sprout /> {t.addDialog.eyebrow}
            </span>
            <DialogTitle>{t.addDialog.title}</DialogTitle>
            <DialogDescription>{t.addDialog.description}</DialogDescription>
          </DialogHeader>
          <Button
            className="dialog-primary"
            onClick={() => onAddOpenChange(false)}
          >
            {t.addDialog.back} <ArrowRight />
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={aboutOpen} onOpenChange={onAboutOpenChange}>
        <DialogContent className="about-dialog" closeLabel={t.dialog.close}>
          <div className="about-botanical-field" aria-hidden="true">
            <Image
              className="about-canopy about-canopy-left"
              src="/map/motion/tree-cluster-v1.webp"
              alt=""
              width={384}
              height={256}
              sizes="260px"
            />
            <Image
              className="about-canopy about-canopy-right"
              src="/map/motion/tree-cluster-v1.webp"
              alt=""
              width={384}
              height={256}
              sizes="260px"
            />
            <span className="about-sprig about-sprig-one">
              <Leaf />
            </span>
            <span className="about-sprig about-sprig-two">
              <Flower2 />
            </span>
            <span className="about-sprig about-sprig-three">
              <Wheat />
            </span>
          </div>
          <DialogHeader className="about-dialog-header">
            <span className="dialog-eyebrow">
              <span className="dialog-eyebrow-icon" aria-hidden="true">
                <Leaf />
              </span>
              {t.aboutDialog.eyebrow}
            </span>
            <DialogTitle>
              {t.aboutDialog.titleStart}{' '}
              <span>{t.aboutDialog.titleAccent}</span>
            </DialogTitle>
            <DialogDescription>{t.aboutDialog.description}</DialogDescription>
          </DialogHeader>
          <ol className="how-list">
            <li>
              <span className="how-icon" aria-hidden="true">
                <Search />
              </span>
              <div className="how-step-copy">
                <strong>{t.aboutDialog.step1Title}</strong>
                <small>{t.aboutDialog.step1Text}</small>
              </div>
              <span className="how-step-number" aria-hidden="true">
                01
              </span>
            </li>
            <li>
              <span className="how-icon" aria-hidden="true">
                <Sprout />
              </span>
              <div className="how-step-copy">
                <strong>{t.aboutDialog.step2Title}</strong>
                <small>{t.aboutDialog.step2Text}</small>
              </div>
              <span className="how-step-number" aria-hidden="true">
                02
              </span>
            </li>
            <li>
              <span className="how-icon" aria-hidden="true">
                <Flower2 />
              </span>
              <div className="how-step-copy">
                <strong>{t.aboutDialog.step3Title}</strong>
                <small>{t.aboutDialog.step3Text}</small>
              </div>
              <span className="how-step-number" aria-hidden="true">
                03
              </span>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
