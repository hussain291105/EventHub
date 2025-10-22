import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Seat, TicketType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SeatSelectorProps {
  seats: Seat[];
  ticketTypes: TicketType[];
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
}

export function SeatSelector({ seats, ticketTypes, selectedSeats, onSeatToggle }: SeatSelectorProps) {
  const sections = Array.from(new Set(seats.map(s => s.section))).sort();
  
  const getTicketTypeName = (ticketTypeId: string) => {
    return ticketTypes.find(t => t.id === ticketTypeId)?.name || "";
  };

  const getSeatsBySection = (section: string) => {
    const sectionSeats = seats.filter(s => s.section === section);
    const rows = Array.from(new Set(sectionSeats.map(s => s.row))).sort();
    
    return rows.map(row => ({
      row,
      seats: sectionSeats.filter(s => s.row === row).sort((a, b) => Number(a.number) - Number(b.number))
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-border bg-background"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary"></div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-muted"></div>
          <span className="text-sm">Taken</span>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <Card key={section} className="p-6">
            <h3 className="font-semibold text-lg mb-4">{section}</h3>
            <div className="space-y-2">
              {getSeatsBySection(section).map(({ row, seats: rowSeats }) => (
                <div key={row} className="flex items-center gap-2">
                  <div className="w-12 text-sm font-medium text-muted-foreground">{row}</div>
                  <div className="flex gap-1 flex-wrap">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeats.includes(seat.id);
                      const isAvailable = seat.isAvailable;
                      
                      return (
                        <Button
                          key={seat.id}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-10 h-10 p-0 text-xs",
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                            !isAvailable && "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          )}
                          onClick={() => isAvailable && onSeatToggle(seat.id)}
                          disabled={!isAvailable}
                          data-testid={`button-seat-${seat.id}`}
                          title={`${section} - Row ${row} - Seat ${seat.number} (${getTicketTypeName(seat.ticketTypeId)})`}
                        >
                          {seat.number}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-block bg-card border-2 border-primary px-12 py-3 rounded-md">
          <span className="font-semibold">STAGE</span>
        </div>
      </div>
    </div>
  );
}
