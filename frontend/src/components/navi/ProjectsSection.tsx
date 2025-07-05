"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import type { Project } from "@/lib/types";
import ProjectFormModal from "./project/ProjectFormModal";
import ProjectCard from "./project/ProjectCard";
import DeleteDialog from "./project/DeleteDialog";
import EmptyState from "./project/EmptyState";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface ProjectsSectionProps {
  projects?: Project[];
  profileId: string;
}

export function ProjectsSection({ projects = [], profileId }: ProjectsSectionProps) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const isOwner = user?.id === profileId;

  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => router.refresh();

  // Enhanced loadProjects function with better error handling
  const loadProjects = async (showToast = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("project")
        .select(`
          *,
          project_media(*),
          project_skill(*)
        `)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error('Error loading projects:', error);
        toast.error('プロジェクトの読み込みに失敗しました');
        return;
      }
      
      // Transform data to match Project type
      const transformedProjects: Project[] = (data || []).map(proj => ({
        id: proj.id,
        profileId: proj.profile_id,
        title: proj.title,
        description: proj.description,
        url: proj.url,
        media: proj.project_media || [],
        skills: proj.project_skill || [],
        createdAt: proj.created_at,
        updatedAt: proj.updated_at,
      }));
      
      setProjectList(transformedProjects);
      
      if (showToast) {
        toast.success('プロジェクトを更新しました');
      }
    } catch (error) {
      console.error('Unexpected error loading projects:', error);
      toast.error('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [profileId]);

  // Handle project deletion with proper cleanup
  const handleDeleteConfirm = async (projectId: string) => {
    try {
      // Get project media for cleanup
      const { data: mediaData } = await supabase
        .from('project_media')
        .select('url')
        .eq('project_id', projectId);

      // Delete from storage
      if (mediaData && mediaData.length > 0) {
        for (const media of mediaData) {
          try {
            const urlParts = media.url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `projects/${fileName}`;
            
            await supabase.storage
              .from('media')
              .remove([filePath]);
          } catch (storageError) {
            console.error('Storage cleanup error:', storageError);
            // Continue with deletion even if storage cleanup fails
          }
        }
      }

      // Delete project (cascading deletes will handle media and skills)
      const { error } = await supabase
        .from('project')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      // Update local state
      setProjectList((list) => list.filter((p) => p.id !== projectId));
      setDeletingProjectId(null);
      toast.success('プロジェクトを削除しました');
      handleRefresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('プロジェクトの削除に失敗しました');
    }
  };

  // Handle opening create modal
  const handleCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  // Handle opening edit modal
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  // Handle closing modal with immediate cleanup
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    
    // Force restore body scroll in case it gets stuck
    document.body.style.overflow = 'unset';
    document.body.style.pointerEvents = 'unset';
  };

  // Handle save from modal with immediate cleanup
  const handleSave = (updatedList: Project[]) => {
    // Update state immediately
    setProjectList(updatedList);
    
    // Close modal immediately
    setIsModalOpen(false);
    setEditingProject(null);
    
    // Ensure body scroll is restored
    document.body.style.overflow = 'unset';
    document.body.style.pointerEvents = 'unset';
    
    // Reload data after a short delay
    setTimeout(() => {
      loadProjects();
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">
          プロジェクト ({projectList.length})
        </h2>
        <div className="flex gap-2">
          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadProjects(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          {/* Add project button */}
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {projectList.length === 0 ? (
        <EmptyState 
          isOwner={isOwner} 
          onStart={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectList.map((proj) => (
            <ProjectCard
              key={`${proj.id}-${proj.updatedAt || proj.createdAt}`}
              project={proj}
              isOwner={isOwner}
              onEdit={() => handleEdit(proj)}
              onDelete={() => setDeletingProjectId(proj.id)}
            />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        profileId={profileId}
        existingProjects={projectList}
        editingProject={editingProject}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        projectId={deletingProjectId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProjectId(null)}
      />
    </div>
  );
}