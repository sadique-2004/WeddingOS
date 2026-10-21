package com.weddingos.api.service;

import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.PreparationTask;
import com.weddingos.api.repository.PreparationTaskRepository;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.weddingos.api.security.WeddingAccessService.weddingIdOf;

@Service
@Transactional
public class TaskService {

    private final PreparationTaskRepository taskRepository;
    private final WeddingAccessService access;

    public TaskService(PreparationTaskRepository taskRepository, WeddingAccessService access) {
        this.taskRepository = taskRepository;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public List<PreparationTask> getTasks(Long weddingId, String category, PreparationTask.Status status) {
        access.require(weddingId, WeddingModule.TASKS);
        if (category != null && !category.equalsIgnoreCase("ALL")) {
            return taskRepository.findByWeddingIdAndCategory(weddingId, category);
        }
        if (status != null) {
            return taskRepository.findByWeddingIdAndStatus(weddingId, status);
        }
        return taskRepository.findByWeddingIdOrderByCreatedAtDesc(weddingId);
    }

    public PreparationTask createTask(Long weddingId, PreparationTask task) {
        var granted = access.require(weddingId, WeddingModule.TASKS);
        task.setId(null); // never let a client-supplied ID overwrite an existing row
        task.setWedding(granted.wedding());
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
        PreparationTask task = loadAuthorized(taskId);

        if (task.getStatus() == PreparationTask.Status.COMPLETED) {
            task.setStatus(PreparationTask.Status.TODO);
        } else {
            task.setStatus(PreparationTask.Status.COMPLETED);
        }
        return taskRepository.save(task);
    }

    public PreparationTask updateTask(Long taskId, PreparationTask updates) {
        PreparationTask task = loadAuthorized(taskId);

        if (updates.getTitle() != null) task.setTitle(updates.getTitle());
        if (updates.getCategory() != null) task.setCategory(updates.getCategory());
        if (updates.getPriority() != null) task.setPriority(updates.getPriority());
        if (updates.getStatus() != null) task.setStatus(updates.getStatus());
        if (updates.getDueDate() != null) task.setDueDate(updates.getDueDate());

        return taskRepository.save(task);
    }

    public void deleteTask(Long taskId) {
        taskRepository.delete(loadAuthorized(taskId));
    }

    /** Loads a task and checks TASKS permission on the wedding that owns it. */
    private PreparationTask loadAuthorized(Long taskId) {
        PreparationTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
        access.require(weddingIdOf(task.getWedding()), WeddingModule.TASKS);
        return task;
    }
}
