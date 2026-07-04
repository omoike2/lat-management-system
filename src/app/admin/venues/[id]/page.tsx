import { notFound } from "next/navigation";
import { getVenue } from "@/features/venues/queries";
import VenueEditClient from "./venue-edit-client";

export default async function VenueEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = await getVenue(id);
  if (!venue) notFound();
  return <VenueEditClient venue={venue} />;
}
