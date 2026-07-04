import { listVenues } from "@/features/venues/queries";
import VenuesClient from "./venues-client";

export default async function VenuesPage() {
  const venues = await listVenues();
  return <VenuesClient venues={venues} />;
}
