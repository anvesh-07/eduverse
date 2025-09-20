"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, Archive, Trash2, Pencil } from "lucide-react";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/config/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface MyContentActionsProps {
  contentId: string;
}

export function MyContentActions({ contentId }: MyContentActionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleArchive = async () => {
    setIsProcessing(true);
    try {
      const docRef = doc(db, "content", contentId);
      await updateDoc(docRef, { status: "archived" });
      toast({
        title: "Content Archived",
        description: "The content has been moved to your archive.",
      });
    } catch (error) {
      console.error("Error archiving content:", error);
      toast({
        title: "Error",
        description: "Could not archive the content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsArchiveDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
        const docRef = doc(db, "content", contentId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error("Document does not exist.");
        }

        const data = docSnap.data();
        const fileUrl = data.fileUrl;

        // Delete the file from Firebase Storage
        if (fileUrl) {
            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef);
        }

        // Delete the document from Firestore
        await deleteDoc(docRef);

        toast({
            title: "Content Deleted",
            description: "The content has been permanently deleted.",
        });
    } catch (error) {
        console.error("Error deleting content:", error);
        toast({
            title: "Error",
            description: "Could not delete the content. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsProcessing(false);
        setIsDeleteDialogOpen(false);
    }
  };
  
  const handleEdit = () => {
    router.push(`/my-content/${contentId}/edit`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)}>
            <Archive className="mr-2 h-4 w-4" />
            <span>Archive</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Content?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this content? It will be hidden from public view but not permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={isProcessing}>
              {isProcessing ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. This will delete the content and its associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
