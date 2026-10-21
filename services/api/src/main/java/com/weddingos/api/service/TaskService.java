package com.weddingos.api.service;

import com.weddingos.api.model.PreparationTask;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.PreparationTaskRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private final PreparationTaskRepository taskRepository;
    private final WeddingRepository weddingRepository;

    public TaskService(PreparationTaskRepository taskRepository, WeddingRepository weddingRepository) {
        this.taskRepository = taskRepository;
        this.weddingRepository = weddingRepository;
    }

    @Transactional(readOnly = true)
    public List<PreparationTask> getTasks(Long weddingId, String category, PreparationTask.Status status) {
        if (category != null && !category.equalsIgnoreCase("ALL")) {
            return taskRepository.findByWeddingIdAndCategory(weddingId, category);
        }
        if (status != null) {
            return taskRepository.findByWeddingIdAndStatus(weddingId, status);
        }
        return taskRepository.findByWeddingIdOrderByCreatedAtDesc(weddingId);
    }

    public PreparationTask createTask(Long weddingId, PreparationTask task) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));
        task.setWedding(wedding);
        if (task.getCategory() == null || task.getCategory().isBlank()) {
            task.setCategory("General");
        }
        if (task.getPriority() == null) {
            task.setPriority(PreparationTask.Priority.NORMAL);
        }
        if (task.getStatus() == null) {
            task.setStatus(PreparationTask.Status.TODO);
        }
        return taskRepository.save(task);
    }

    public PreparationTask toggleStatus(Long taskId) {
        PreparationTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
        
        if (task.getStatus() == PreparationTask.Status.COMPLETED) {
            task.setStatus(PreparationTask.Status.TODO);
        } else {
            task.setStatus(PreparationTask.Status.COMPLETED);
        }
        return taskRepository.save(task);
    }

    public PreparationTask updateTask(Long taskId, PreparationTask updates) {
        PreparationTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        if (updates.getTitle() != null) task.setTitle(updates.getTitle());
        if (updates.getCategory() != null) task.setCategory(updates.getCategory());
        if (updates.getPriority() != null) task.setPriority(updates.getPriority());
        if (updates.getStatus() != null) task.setStatus(updates.getStatus());
        if (updates.getDueDate() != null) task.setDueDate(updates.getDueDate());

        return taskRepository.save(task);
    }

    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }
}
