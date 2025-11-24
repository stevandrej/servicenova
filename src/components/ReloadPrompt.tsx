import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from "@nextui-org/react";
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export const ReloadPrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
  })

  useEffect(() => {
    if (needRefresh) {
        toast.info(
            <div className="flex flex-col gap-2">
                <span>New content available, click on reload button to update.</span>
                <Button size="sm" color="primary" onPress={() => updateServiceWorker(true)}>
                    Reload
                </Button>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                onClose: () => setNeedRefresh(false)
            }
        );
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);

  return null;
}
