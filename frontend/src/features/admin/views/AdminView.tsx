import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLogger } from "@/utils/logger";
import { SongsTab } from "@/features/admin/components/SongsTab";
import { ConcertsTab } from "../components/ConcertsTab";
import { InstrumentsTab } from "../components/InstrumentsTab";

const log = createLogger("AdminView");

export function AdminView() {
  log.debug("Admin View");

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-6">
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-6 lg:gap-6 lg:p-0">
          <div className="grid w-full grid-cols-1 items-center md:grid-cols-[1fr_auto_1fr]">
            <h1 className="text-center text-3xl font-bold my-6 md:col-start-2">
              Orchestra Sheet Music Library
            </h1>
            <p className="text-center text-2xl md:col-start-3 md:justify-self-end md:mr-4">Admin</p>
          </div>
          <Separator />
          <Tabs defaultValue="songs" className="w-full h-full flex flex-col">
            <TabsList className="mb-6 mx-auto h-auto shrink-0 gap-6 rounded-none bg-transparent p-0">
              <TabsTrigger value="songs" 
              className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-5 py-3 shadow-none data-active:border-foreground"
              >Songs</TabsTrigger>
              <TabsTrigger value="concerts" 
              className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-5 py-3 shadow-none data-active:border-foreground"
              >Concerts</TabsTrigger>
              <TabsTrigger value="instruments" 
               className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-5 py-3 shadow-none data-active:border-foreground"
              >Instruments</TabsTrigger>
            </TabsList>
            <TabsContent value="songs">
              <SongsTab />
            </TabsContent>
            <TabsContent value="concerts">
              <ConcertsTab />
            </TabsContent>
            <TabsContent value="instruments" className="flex-1 min-h-0 mt-0">
              <InstrumentsTab />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
