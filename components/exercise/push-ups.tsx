import { Card, CardContent } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

const pushUps = [
  {
    id: 1,
    video: "/exercise/push-up-1.mp4",
  },
  {
    id: 2,
    video: "/exercise/push-up-1.mp4",
  },
];

export function PushUps() {
  return (
    <div className="contain px-15">
      <Carousel>
        <CarouselContent>
          {pushUps.map((pushUp) => (
            <CarouselItem key={pushUp.id} className="basis-full md:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="p-0">
                    <video
                      src={pushUp.video}
                      autoPlay
                      loop
                      muted
                      controls
                      className="max-h-[80vh] w-full object-contain"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
