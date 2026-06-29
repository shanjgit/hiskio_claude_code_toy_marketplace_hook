import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FilterSheet from "./FilterSheet";
import { SortBy, SortOrder } from "@/hooks/usePublicProducts";

const onApplyFilter = vi.fn();

function renderFilterSheet(props: {
  currentSortBy?: SortBy;
  currentSortOrder?: SortOrder;
} = {}) {
  return render(
    <FilterSheet onApplyFilter={onApplyFilter} {...props}>
      <button>Open Filter</button>
    </FilterSheet>
  );
}

async function openSheet() {
  await userEvent.click(screen.getByRole("button", { name: "Open Filter" }));
}

describe("FilterSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  describe("rendering", () => {
    it("renders the trigger child", () => {
      renderFilterSheet();
      expect(screen.getByRole("button", { name: "Open Filter" })).toBeInTheDocument();
    });

    it("does not show sheet content before trigger is clicked", () => {
      renderFilterSheet();
      expect(screen.queryByText("Sort Products")).not.toBeInTheDocument();
    });

    it("shows the sheet header after opening", async () => {
      renderFilterSheet();
      await openSheet();
      expect(screen.getByText("Sort Products")).toBeInTheDocument();
    });

    it("shows Sort by section with Date Added and Price options", async () => {
      renderFilterSheet();
      await openSheet();
      expect(screen.getByText("Sort by")).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "Date Added" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "Price" })).toBeInTheDocument();
    });

    it("shows Order section with two order options", async () => {
      renderFilterSheet();
      await openSheet();
      expect(screen.getByText("Order")).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "Newest First" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "Oldest First" })).toBeInTheDocument();
    });

    it("shows Apply Filter button", async () => {
      renderFilterSheet();
      await openSheet();
      expect(screen.getByRole("button", { name: "Apply Filter" })).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Default state
  // ---------------------------------------------------------------------------

  describe("default state", () => {
    it("selects Date Added by default", async () => {
      renderFilterSheet();
      await openSheet();
      expect(screen.getByRole("radio", { name: "Date Added" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Price" })).not.toBeChecked();
    });

    it("selects Newest First (desc) by default", async () => {
      renderFilterSheet();
      await openSheet();
      expect(screen.getByRole("radio", { name: "Newest First" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Oldest First" })).not.toBeChecked();
    });

    it("shows date-mode order labels by default", async () => {
      renderFilterSheet();
      await openSheet();
      expect(screen.getByText("Newest First")).toBeInTheDocument();
      expect(screen.getByText("Oldest First")).toBeInTheDocument();
      expect(screen.queryByText("High to Low")).not.toBeInTheDocument();
      expect(screen.queryByText("Low to High")).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Props initialisation
  // ---------------------------------------------------------------------------

  describe("props initialisation", () => {
    it("initialises with asc order when currentSortOrder='asc'", async () => {
      renderFilterSheet({ currentSortOrder: "asc" });
      await openSheet();
      expect(screen.getByRole("radio", { name: "Oldest First" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Newest First" })).not.toBeChecked();
    });

    it("initialises Date Added when currentSortBy='created_at'", async () => {
      renderFilterSheet({ currentSortBy: "created_at" });
      await openSheet();
      expect(screen.getByRole("radio", { name: "Date Added" })).toBeChecked();
    });
  });

  // ---------------------------------------------------------------------------
  // Sort by selection and label switching
  // ---------------------------------------------------------------------------

  describe("sort by selection", () => {
    it("switches to Price when Price radio is clicked", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("radio", { name: "Price" }));
      expect(screen.getByRole("radio", { name: "Price" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Date Added" })).not.toBeChecked();
    });

    it("changes order labels to High to Low / Low to High when Price is selected", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("radio", { name: "Price" }));
      expect(screen.getByText("High to Low")).toBeInTheDocument();
      expect(screen.getByText("Low to High")).toBeInTheDocument();
      expect(screen.queryByText("Newest First")).not.toBeInTheDocument();
      expect(screen.queryByText("Oldest First")).not.toBeInTheDocument();
    });

    it("reverts order labels to Newest/Oldest when switching back to Date Added", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("radio", { name: "Price" }));
      await userEvent.click(screen.getByRole("radio", { name: "Date Added" }));
      expect(screen.getByText("Newest First")).toBeInTheDocument();
      expect(screen.getByText("Oldest First")).toBeInTheDocument();
      expect(screen.queryByText("High to Low")).not.toBeInTheDocument();
      expect(screen.queryByText("Low to High")).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // onApplyFilter calls
  // ---------------------------------------------------------------------------

  describe("onApplyFilter", () => {
    it("calls onApplyFilter with created_at + desc when applied with defaults", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("button", { name: "Apply Filter" }));
      expect(onApplyFilter).toHaveBeenCalledOnce();
      expect(onApplyFilter).toHaveBeenCalledWith("created_at", "desc");
    });

    it("calls onApplyFilter with created_at + asc after selecting Oldest First", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("radio", { name: "Oldest First" }));
      await userEvent.click(screen.getByRole("button", { name: "Apply Filter" }));
      expect(onApplyFilter).toHaveBeenCalledWith("created_at", "asc");
    });

    it("calls onApplyFilter with price + desc when Price is selected", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("radio", { name: "Price" }));
      await userEvent.click(screen.getByRole("button", { name: "Apply Filter" }));
      expect(onApplyFilter).toHaveBeenCalledWith("price", "desc");
    });

    it("calls onApplyFilter with price + asc when Price + Low to High is selected", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("radio", { name: "Price" }));
      await userEvent.click(screen.getByRole("radio", { name: "Low to High" }));
      await userEvent.click(screen.getByRole("button", { name: "Apply Filter" }));
      expect(onApplyFilter).toHaveBeenCalledWith("price", "asc");
    });

    it("calls onApplyFilter with price + desc when Price + High to Low is selected", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("radio", { name: "Price" }));
      await userEvent.click(screen.getByRole("radio", { name: "High to Low" }));
      await userEvent.click(screen.getByRole("button", { name: "Apply Filter" }));
      expect(onApplyFilter).toHaveBeenCalledWith("price", "desc");
    });

    it("uses initialised sort order from props when applying without changes", async () => {
      renderFilterSheet({ currentSortOrder: "asc" });
      await openSheet();
      await userEvent.click(screen.getByRole("button", { name: "Apply Filter" }));
      expect(onApplyFilter).toHaveBeenCalledWith("created_at", "asc");
    });

    it("does not call onApplyFilter if sheet is closed without applying", async () => {
      renderFilterSheet();
      await openSheet();
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByText("Sort Products")).not.toBeInTheDocument();
      });
      expect(onApplyFilter).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Sheet open/close behaviour
  // ---------------------------------------------------------------------------

  describe("sheet behaviour", () => {
    it("closes the sheet after Apply Filter is clicked", async () => {
      renderFilterSheet();
      await openSheet();
      expect(screen.getByText("Sort Products")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Apply Filter" }));
      await waitFor(() => {
        expect(screen.queryByText("Sort Products")).not.toBeInTheDocument();
      });
    });

    it("closes the sheet on Escape key", async () => {
      renderFilterSheet();
      await openSheet();
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByText("Sort Products")).not.toBeInTheDocument();
      });
    });

    it("can be re-opened after being closed", async () => {
      renderFilterSheet();
      await openSheet();
      await userEvent.click(screen.getByRole("button", { name: "Apply Filter" }));
      await waitFor(() => expect(screen.queryByText("Sort Products")).not.toBeInTheDocument());
      await openSheet();
      expect(screen.getByText("Sort Products")).toBeInTheDocument();
    });
  });
});
